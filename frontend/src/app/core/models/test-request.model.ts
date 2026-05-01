export interface TestRequest {
  readonly url: string;
  readonly username: string;
  readonly password: string;
  readonly featureName: string;
  readonly llmEnabled: boolean;
  readonly llmApiKey: string;
  readonly llmProvider: string;
}
