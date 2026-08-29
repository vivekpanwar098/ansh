type PageHeaderProps = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="bg-linear-to-r from-[#18A096] to-[#12544F] rounded-2xl p-4 text-white shadow-md">
      <div className="min-w-0 flex-1 text-lg">{title}</div>
      {Boolean(description) && (
        <div className="text-white/60 text-sm">{description}</div>
      )}
    </section>
  );
}
