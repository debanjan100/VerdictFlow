import { createClient } from './client';

export async function uploadJudgmentPDF(file: File, caseId: string) {
  const supabase = createClient();
  const filename = `${caseId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('judgments')
    .upload(filename, file, {
      contentType: 'application/pdf',
      upsert: false,
    });
    
  if (error) throw error;
  
  // Create a signed URL valid for 1 year since the bucket is not public by default
  const { data: signedUrlData, error: signError } = await supabase.storage
    .from('judgments')
    .createSignedUrl(filename, 60 * 60 * 24 * 365);
    
  if (signError) throw signError;

  return {
    publicUrl: signedUrlData.signedUrl,
    filename: filename
  };
}
