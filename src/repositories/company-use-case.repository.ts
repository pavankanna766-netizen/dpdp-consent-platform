import { supabaseAdmin } from "@/lib/supabase/admin";

export async function replaceCompanyUseCases(
  companyId: string,
  useCases: string[]
) {
  // Remove existing use cases
  const { error: deleteError } = await supabaseAdmin
    .from("company_use_cases")
    .delete()
    .eq("company_id", companyId);

  if (deleteError) {
    return { error: deleteError };
  }

  // Nothing selected
  if (useCases.length === 0) {
    return { error: null };
  }

  // Insert new selections
  return supabaseAdmin
    .from("company_use_cases")
    .insert(
      useCases.map((useCase) => ({
        company_id: companyId,
        use_case: useCase,
      }))
    );
}