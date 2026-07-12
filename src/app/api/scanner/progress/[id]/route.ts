import { summaryService } from "@/modules/scanner";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { id } =
    await params;

  const progress =
    await summaryService.progress(
      id
    );

  return Response.json(
    progress
  );
}