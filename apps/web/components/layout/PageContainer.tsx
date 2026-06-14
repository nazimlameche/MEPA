interface PageContainerProps {
  children: React.ReactNode;
  size?: 'narrow' | 'default' | 'wide';
}

const MAX_WIDTHS = {
  narrow:  'max-w-2xl',
  default: 'max-w-4xl',
  wide:    'max-w-6xl',
} as const;

export default function PageContainer({ children, size = 'default' }: PageContainerProps) {
  return (
    <div className={`${MAX_WIDTHS[size]} mx-auto w-full px-5 md:px-8 py-8 md:py-10`}>
      {children}
    </div>
  );
}
