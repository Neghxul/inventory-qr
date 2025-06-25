export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-4 text-sm mt-12">
      <p>
        &copy; {new Date().getFullYear()} QR & Inventory App. Built with Next.js, Tailwind CSS, and Prisma.
      </p>
    </footer>
  );
}
