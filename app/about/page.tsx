import Header from '@/components/layout/header';
import FooterOne from '@/components/footer/footer-one';

export default function AboutPage() {
  return (
    <>

    {/* Header */}
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center">
        <h1 className="text-4xl font-bold">About Us</h1>
      </div>



      {/* Footer */}
      <FooterOne />
    </>
  );
}
