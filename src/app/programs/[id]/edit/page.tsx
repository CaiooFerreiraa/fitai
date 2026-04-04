import { ConfigEditor } from "@/components/config-editor"

export default async function ProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ConfigEditor programId={id} />
}
