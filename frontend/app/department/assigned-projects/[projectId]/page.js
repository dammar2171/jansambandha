import RoleWorkspace from '../../../components/jansambandha/RoleWorkspace';
export default async function Page({ params }) {
  const { projectId } = await params;
  return (
    <RoleWorkspace
      role='department'
      section='assigned-projects'
      projectId={projectId}
    />
  );
}
