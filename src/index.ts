import mockRequire from 'mock-require';
import path from 'path';
import resolveFrom from 'resolve-from';
import resolveGlobal from 'resolve-global';
import { ParsedCommandLine } from 'typescript-to-lua';
import * as ts_module from 'typescript/lib/tsserverlibrary';

const pluginMarker = Symbol('pluginMarker');
class TSTLPlugin {
  constructor(
    private ts: typeof ts_module,
    private languageService: ts_module.LanguageService,
    private project: ts_module.server.Project,
    private serverHost: ts_module.server.ServerHost,
  ) {}

  private log(message: string) {
    this.project.log(`[typescript-tstl-plugin] ${this.project.getProjectName()}: ${message}`);
  }

  private parsedCommandLine?: ParsedCommandLine;
  public update() {
    this.log('Updating project');
    if (!(this.project instanceof this.ts.server.ConfiguredProject)) return;

    const configFilePath = this.project.getConfigFilePath();
    this.parsedCommandLine = this.tstl.updateParsedConfigFile(
      this.ts.parseJsonSourceFileConfigFileContent(
        this.ts.readJsonConfigFile(configFilePath, this.serverHost.readFile),
        this.serverHost,
        path.dirname(configFilePath),
        undefined,
        configFilePath,
      ),
    );
  }

  private _tstl?: typeof import('typescript-to-lua');
  private get tstl() {
    if (!this._tstl) {
      const resolved =
        resolveFrom.silent(this.project.getCurrentDirectory(), 'typescript-to-lua') ||
        resolveGlobal.silent('typescript-to-lua') ||
        'typescript-to-lua';

      this.log(`Loading typescript-to-lua from "${resolved}"`);
      this._tstl = require(resolved);
    }

    return this._tstl!;
  }

  public wrap() {
    this.log('Wrapping language service');
    this.update();

    const intercept: Partial<ts_module.LanguageService> = Object.create(null);
    (intercept as any)[pluginMarker] = this;
    intercept.getSemanticDiagnostics = this.getSemanticDiagnostics.bind(this);
    return new Proxy(this.languageService, {
      get: (target, property) => (intercept as any)[property] || (target as any)[property],
    });
  }

  private getSemanticDiagnostics(fileName: string) {
    const diagnostics = this.languageService.getSemanticDiagnostics(fileName);
    const program = this.languageService.getProgram();
    if (!program) return diagnostics;

    const sourceFile = program.getSourceFile(fileName);
    if (sourceFile && !sourceFile.isDeclarationFile) {
      diagnostics.push(...this.getTstlDiagnostics(program, sourceFile));
    }

    return diagnostics;
  }

  private getTstlDiagnostics(program: ts_module.Program, sourceFile: ts_module.SourceFile) {
    if (this.parsedCommandLine != null && this.parsedCommandLine.raw.tstl != null) {
      Object.assign(program.getCompilerOptions(), this.parsedCommandLine.options);

      const transformer = new this.tstl.LuaTransformer(program);
      try {
        transformer.transformSourceFile(sourceFile);
      } catch (err) {
        if (err instanceof this.tstl.TranspileError) {
          const diagnostic: ts_module.Diagnostic = {
            category: this.ts.DiagnosticCategory.Error,
            code: 0,
            file: err.node.getSourceFile(),
            start: err.node.getStart(),
            length: err.node.getWidth(),
            messageText: err.message,
            source: 'typescript-to-lua',
          };

          return [diagnostic];
        }

        this.log(`Error during transpilation: ${err.stack}`);
      }
    }

    return [];
  }
}

const init: ts_module.server.PluginModuleFactory = ({ typescript }) => {
  mockRequire('typescript', typescript);

  return {
    create({ languageService, project, serverHost }) {
      const oldPlugin: TSTLPlugin | undefined = (languageService as any)[pluginMarker];
      if (oldPlugin) {
        oldPlugin.update();
        return languageService;
      }

      const plugin = new TSTLPlugin(typescript, languageService, project, serverHost);
      return plugin.wrap();
    },
  };
};

export = init;
