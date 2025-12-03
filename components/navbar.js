class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .navbar {
          transition: all 0.3s ease;
        }
        .navbar.scrolled {
          background-color: rgba(107, 70, 193, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .nav-link {
          position: relative;
        }
        .nav-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: white;
          transition: width 0.3s ease;
        }
        .nav-link:hover:after {
          width: 100%;
        }
        .mobile-menu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .mobile-menu.open {
          max-height: 300px;
        }
      </style>
      <nav class="navbar fixed w-full z-50 text-white py-4 px-6 md:px-12">
        <div class="container mx-auto flex justify-between items-center">
          <a href="/" class="flex items-center gap-2">
            <div class="bg-white text-purple-600 p-2 rounded-lg">
              <i data-feather="camera" class="w-6 h-6"></i>
            </div>
            <span class="text-xl font-bold">SelfieBox Eventz</span>
          </a>
          
          <div class="hidden md:flex items-center gap-8">
            <a href="#about" class="nav-link">About</a>
            <a href="#services" class="nav-link">Services</a>
            <a href="#gallery" class="nav-link">Gallery</a>
            <a href="#contact" class="nav-link">Contact</a>
            <a href="https://www.instagram.com/selfieebox_eventz?igsh=ZjdteW1xZm55ZDAx" target="_blank" class="bg-white text-purple-600 hover:bg-gray-100 px-6 py-2 rounded-full font-medium transition duration-300 flex items-center gap-2">
<i data-feather="instagram" class="w-4 h-4"></i>
              Follow Us
            </a>
          </div>
          
          <button class="md:hidden focus:outline-none" id="mobile-menu-button">
            <i data-feather="menu" class="w-6 h-6"></i>
          </button>
        </div>
        
        <div class="mobile-menu container mx-auto md:hidden" id="mobile-menu">
          <div class="flex flex-col gap-4 py-4">
            <a href="#about" class="nav-link block py-2">About</a>
            <a href="#services" class="nav-link block py-2">Services</a>
            <a href="#gallery" class="nav-link block py-2">Gallery</a>
            <a href="#contact" class="nav-link block py-2">Contact</a>
            <a href="https://www.instagram.com/selfieebox_eventz?igsh=ZjdteW1xZm55ZDAx" target="_blank" class="flex items-center gap-2 py-2">
<i data-feather="instagram" class="w-4 h-4"></i>
              Follow Us
            </a>
          </div>
        </div>
      </nav>
      
      <script>
        // Handle mobile menu toggle
        const mobileMenuButton = this.shadowRoot.getElementById('mobile-menu-button');
        const mobileMenu = this.shadowRoot.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', function() {
          mobileMenu.classList.toggle('open');
          const icon = mobileMenuButton.querySelector('i');
          if (mobileMenu.classList.contains('open')) {
            feather.icons['x'].replace(icon);
          } else {
            feather.icons['menu'].replace(icon);
          }
        });
        
        // Handle navbar scroll effect
        const navbar = this.shadowRoot.querySelector('.navbar');
        window.addEventListener('scroll', function() {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        });
        
        // Initialize feather icons
        feather.replace();
      </script>
    `;
  }
}
customElements.define('custom-navbar', CustomNavbar);