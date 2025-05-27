// frontend/app/blog/layout.js
import Navbar from '../../components/Navbar';

export default function BlogLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}