import { error } from '@sveltejs/kit';

export function throwCodeSnippetNotFoundError(codeSnippetId: number): never {
  throw error(404, `Code snippet with ID ${codeSnippetId} not found`);
}

export function throwCodeSnippetDeletionUnauthorizedError(): never {
  throw error(403, 'You are not authorized to delete this code snippet');
}
