export interface SuperformsOnErrorResult {
  type: 'error';
  status?: number;
  error: App.Error;
}

export type SuperformsMessage = App.Superforms.Message;
