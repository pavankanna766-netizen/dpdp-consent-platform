import {
  reportService,
} from "@/modules/scanner";

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

  const report =
    await reportService.generate(
      id
    );

  return Response.json(
    report
  );
}