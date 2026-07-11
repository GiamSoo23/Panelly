// TODO(julia): top-3 installer cards, pricing/payback table, tip display.
// Build against SurveyResultSchema in @/lib/schemas/survey.
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>results/{id} — TODO(julia)</div>;
}
