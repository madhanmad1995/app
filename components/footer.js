class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .footer-link:hover {
          color: #a78bfa;
          transform: translateX(4px);
        }
        .social-icon {
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          transform: translateY(-4px);
        }
      </style>
      <footer class="bg-gray-900 text-white py-12 px-6">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="md:col-span-2">
              <div class="flex items-center gap-2 mb-6">
                <div class="bg-purple-600 text-white p-2 rounded-lg">
                  <i data-feather="camera" class="w-6 h-6"></i>
                </div>
                <span class="text-xl font-bold">SelfieBox Eventz</span>
              </div>
              <p class="text-gray-400 mb-6">Creating unforgettable experiences through professional event management and photo booth services in Coimbatore.</p>
              <div class="flex gap-4">
                <a href="https://www.instagram.com/selfieebox_eventz?igsh=ZjdteW1xZm55ZDAx" target="_blank" class="social-icon bg-gray-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
<i data-feather="instagram" class="w-5 h-5"></i>
                </a>
                <a href="mailto:selfieboxeventz@gmail.com" class="social-icon bg-gray-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <i data-feather="mail" class="w-5 h-5"></i>
                </a>
                <a href="tel:+919876543210" class="social-icon bg-gray-800 hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <i data-feather="phone" class="w-5 h-5"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-bold mb-6">Quick Links</h3>
              <ul class="space-y-3">
                <li><a href="#about" class="footer-link text-gray-400 hover:text-purple-400 transition duration-300 flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> About Us</a></li>
                <li><a href="#services" class="footer-link text-gray-400 hover:text-purple-400 transition duration-300 flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> Services</a></li>
                <li><a href="#gallery" class="footer-link text-gray-400 hover:text-purple-400 transition duration-300 flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> Gallery</a></li>
                <li><a href="#contact" class="footer-link text-gray-400 hover:text-purple-400 transition duration-300 flex items-center gap-2"><i data-feather="chevron-right" class="w-4 h-4"></i> Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-lg font-bold mb-6">Contact Info</h3>
              <ul class="space-y-3 text-gray-400">
                <li class="flex items-start gap-3">
                  <i data-feather="map-pin" class="w-5 h-5 mt-1 text-purple-400"></i>
                  <span>K.vadamadurai, Thudiyalur,<br>Coimbatore: 641017</span>
                </li>
                <li class="flex items-center gap-3">
                  <i data-feather="mail" class="w-5 h-5 text-purple-400"></i>
                  <a href="mailto:selfieboxeventz@gmail.com" class="hover:text-purple-400">selfieboxeventz@gmail.com</a>
                </li>
                <li class="flex items-center gap-3">
                  <i data-feather="instagram" class="w-5 h-5 text-purple-400"></i>
                  <a href="https://www.instagram.com/selfieebox_eventz?igsh=ZjdteW1xZm55ZDAx" target="_blank" class="hover:text-purple-400">@selfieebox_eventz</a>
</li>
              </ul>
            </div>
          </div>
          
          <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; ${new Date().getFullYear()} SelfieBox Event Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <script>
        feather.replace();
      </script>
    `;
  }
}
customElements.define('custom-footer', CustomFooter);