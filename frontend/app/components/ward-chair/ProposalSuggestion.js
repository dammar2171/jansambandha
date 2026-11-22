import Card from '@/app/components/ui/Card';
import { ButtonLink } from '@/app/components/ui/Button';

export default function ProposalSuggestion() {
  return (
    <Card className='flex flex-col gap-3 p-5'>
      <h2 className='text-[16px] font-semibold leading-[21px] text-ink'>
        Turn needs into proposals
      </h2>
      <p className='text-[14px] leading-[21px] text-ink-2'>
        Use residents&apos; feedback to prepare a project proposal for Ward 4.
      </p>
      <ButtonLink
        href='/ward-chair/proposals/new'
        size='dash'
        className='w-full'
      >
        Create proposal
      </ButtonLink>
    </Card>
  );
}
