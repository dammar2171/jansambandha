import {ApprovalDetail} from '../../../../components/cao/pages';export default async function Page({params}){const {proposalId}=await params;return <ApprovalDetail id={proposalId}/> }
