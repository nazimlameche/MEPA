import type { CourseBlock } from '@/lib/types/course';
import TextBlockComponent from './TextBlock';
import StoryBlockComponent from './StoryBlock';
import QuizBlockComponent from './QuizBlock';
import FillBlankBlockComponent from './FillBlankBlock';
import TipBlockComponent from './TipBlock';
import PromptingChallengeBlockComponent from './blocks/PromptingChallengeBlock';

interface BlockRendererProps {
  block: CourseBlock;
  onValidate?: (correct: boolean) => void;
}

export default function BlockRenderer({ block, onValidate }: BlockRendererProps) {
  switch (block.type) {
    case 'text':                return <TextBlockComponent block={block} />;
    case 'story':               return <StoryBlockComponent block={block} />;
    case 'quiz':                return <QuizBlockComponent block={block} {...(onValidate && { onValidate })} />;
    case 'fill_blank':          return <FillBlankBlockComponent block={block} {...(onValidate && { onValidate })} />;
    case 'tip':                 return <TipBlockComponent block={block} />;
    case 'prompting_challenge': return <PromptingChallengeBlockComponent block={block} />;
    default:                    return null;
  }
}
