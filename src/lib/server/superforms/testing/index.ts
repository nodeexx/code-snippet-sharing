export function getMockFormData(
  data: Record<string, string | Blob> = {},
): () => Promise<FormData> {
  const formData = new FormData();
  formData.append('__superform_id', 'mock-superform-id');
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const formDataFn = () => Promise.resolve(formData);

  return formDataFn;
}
