import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

function Footer (){
  return (
    <footer className="bg-blue-50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-4">
          <a href="#" className="mx-2 text-gray-600 hover:text-gray-800">
            <FaFacebookF size={24} />
          </a>
          <a href="#" className="mx-2 text-gray-600 hover:text-gray-800">
            <FaInstagram size={24} />
          </a>
          <a href="#" className="mx-2 text-gray-600 hover:text-gray-800">
            <FaTwitter size={24} />
          </a>
          <a href="#" className="mx-2 text-gray-600 hover:text-gray-800">
            <FaYoutube size={24} />
          </a>
        </div>
        <p className="text-center text-sm text-gray-600">
          Copyright &copy; 2023 Apengjers. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;