import { ProjectDetail } from '../../../components/cao/pages';
export default async function Page({ params }) {
  const { projectId } = await params;
  return <ProjectDetail id={projectId} />;
}
