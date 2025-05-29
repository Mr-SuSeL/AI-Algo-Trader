// frontend/app/blog/layout.js
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function BlogLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}