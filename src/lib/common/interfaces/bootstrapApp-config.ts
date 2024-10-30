export interface IBootstrapAppConfig {
  name: string;
  version: string;
  basePath?: string;
  port: number;
  bearerAuth?: boolean;
}
