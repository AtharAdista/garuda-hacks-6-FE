const teamMembers = [
  {
    name: "Ilham Ghani Adrin Sapta",
    role: "Developer",
    instagram: "https://instagram.com/placeholder1",
    linkedin: "https://linkedin.com/in/placeholder1",
    avatar:
      "https://ui-avatars.com/api/?name=Person+One&background=E11D48&color=fff",
  },
  {
    name: "Shaquille Athar Adista",
    role: "Developer",
    instagram: "https://instagram.com/placeholder2",
    linkedin: "https://linkedin.com/in/placeholder2",
    avatar:
      "https://ui-avatars.com/api/?name=Person+Two&background=E11D48&color=fff",
  },
  {
    name: "Febrian Irvansyah",
    role: "Developer",
    instagram: "https://instagram.com/placeholder3",
    linkedin: "https://linkedin.com/in/placeholder3",
    avatar:
      "https://ui-avatars.com/api/?name=Person+Three&background=E11D48&color=fff",
  },
  {
    name: "Tengku Laras Malahayati",
    role: "Developer",
    instagram: "https://instagram.com/placeholder4",
    linkedin: "https://linkedin.com/in/placeholder4",
    avatar:
      "https://ui-avatars.com/api/?name=Person+Four&background=E11D48&color=fff",
  },
];

const resources = [
  {
    name: "Leaflet.js",
    url: "https://leafletjs.com/",
    desc: "Interactive maps for geospatial visualization",
    icon: "🗺️",
  },
  {
    name: "Tailwind CSS",
    url: "https://tailwindcss.com/",
    desc: "Utility-first CSS framework for rapid UI development",
    icon: "🎨",
  },
  {
    name: "React",
    url: "https://react.dev/",
    desc: "Modern frontend library for building user interfaces",
    icon: "⚛️",
  },
  {
    name: "GeoJSON Data",
    url: "https://github.com/",
    desc: "Indonesian provinces geographic data for mapping",
    icon: "📊",
  },
  {
    name: "Google AI Studio",
    url: "https://aistudio.google.com/",
    desc: "Advanced AI technology for intelligent assistance",
    icon: "🤖",
  },
  {
    name: "Websocket",
    url: "https://websocket.org/",
    desc: "Real-time communication for web applications",
    icon: "🌐",
  },
];

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-slate-100 mt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-rose-800/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl mb-8 shadow-xl">
              <span className="text-3xl text-white font-bold">S</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent mb-6">
              About Team Skoopi
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We are a passionate team of four dedicated individuals committed
              to bridging the gap in
              <span className="text-rose-600 font-semibold">
                {" "}
                Indonesian cultural awareness
              </span>
              . Our mission is to transform learning about Indonesia's rich
              heritage into an engaging, interactive, and accessible experience
              for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Meet Our Team
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-500 to-rose-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-8 text-center">
                {/* Avatar with animation */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full scale-110 opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="relative w-24 h-24 mx-auto rounded-full border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-rose-600 font-semibold text-sm uppercase tracking-wide mb-6 opacity-80">
                  {member.role}
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v4.74z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Technologies & Resources
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Powered by cutting-edge technologies and reliable resources to
              deliver the best experience
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-500 to-rose-600 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, idx) => (
              <div
                key={idx}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-rose-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl w-14 h-14 flex items-center justify-center group-hover:from-rose-500 group-hover:to-rose-600 transition-all duration-500">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-white hover:text-rose-400 transition-colors duration-300 block mb-2"
                    >
                      {resource.name}
                    </a>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {resource.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Join Us in Celebrating Indonesian Culture
          </h3>
          <p className="text-rose-100 text-lg mb-8 leading-relaxed">
            Discover the beauty and richness of Indonesia's diverse cultural
            heritage through our interactive platform.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
            <span>Made with</span>
            <span className="text-rose-200">❤️</span>
            <span>in Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
