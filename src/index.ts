import mockRequire from 'mock-require';
import path from 'path';
import resolveFrom from 'resolve-from';
import resolveGlobal from 'resolve-global';
import type * as tstl from 'typescript-to-lua';
import type * as tsserverlibrary from 'typescript/lib/tsserverlibrary';

const pluginMarker = Symbol('pluginMarker');
class TSTLPlugin {
  constructor(
    private readonly ts: typeof tsserverlibrary,
    private readonly languageService: tsserverlibrary.LanguageService,
    private readonly project: tsserverlibrary.server.Project,
    private readonly serverHost: tsserverlibrary.server.ServerHost,
  ) {}

  private log(message: string) {
    this.project.log(`[typescript-tstl-plugin] ${this.project.getProjectName()}: ${message}`);
  }

  private parsedCommandLine?: tstl.ParsedCommandLine;
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this._tstl = require(resolved);
    }

    return this._tstl!;
  }

  public wrap() {
    this.log('Wrapping language service');
    this.update();

    const intercept: Partial<tsserverlibrary.LanguageService> = Object.create(null);
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

  private getTstlDiagnostics(
    program: tsserverlibrary.Program,
    sourceFile: tsserverlibrary.SourceFile,
  ) {
    if (this.parsedCommandLine?.raw.tstl != null) {
      const programOptions = program.getCompilerOptions();
      Object.assign(programOptions, this.parsedCommandLine.options);
      programOptions.noEmit = true;
      programOptions.noEmitOnError = false;
      programOptions.declaration = false;
      programOptions.declarationMap = false;
      programOptions.emitDeclarationOnly = false;

      try {
        let diagnostics: tsserverlibrary.Diagnostic[] | undefined;

        // >=0.35.0
        if (this.tstl.getProgramTranspileResult !== undefined) {
          ({ diagnostics } = this.tstl.getProgramTranspileResult(this.serverHost, () => {}, {
            program,
            sourceFiles: [sourceFile],
          }));
        }

        // >=0.19.0
        if (this.tstl.transpile !== undefined) {
          ({ diagnostics } = this.tstl.transpile({ program, sourceFiles: [sourceFile] }));
        }

        if (diagnostics === undefined) {
          throw new Error(`Unsupported TypeScriptToLua version: ${this.tstl.version}`);
        }

        return diagnostics.map(diag => ({ ...diag, code: undefined! }));
      } catch (error) {
        this.log(`Error during transpilation: ${error.stack}`);
      }
    }

    return [];
  }
}

const init: tsserverlibrary.server.PluginModuleFactory = ({ typescript }) => {
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
