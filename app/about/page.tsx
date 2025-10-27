import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
            ← Retourner à la page principale
          </Link>
          <h1 className="text-4xl font-bold">About Our Journey</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Our Story */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🚴‍♂️ Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Welcome to our cycling adventure across Europe! We're a father-son duo embarking on an 
              incredible journey to cycle through multiple countries, experiencing diverse cultures, 
              breathtaking landscapes, and challenging ourselves physically and mentally.
            </p>
            <p>
              This journey is more than just a cycling trip—it's a mission to raise awareness and funds 
              for a cause that's close to our hearts. Every kilometer we pedal brings us closer to our 
              goal and makes a real difference in the lives of those we're helping.
            </p>
            <p>
              Follow along as we share our daily adventures, challenges, triumphs, and the incredible 
              people we meet along the way!
            </p>
          </div>
        </section>

        {/* The Riders */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">👥 Meet the Riders</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl">👨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rider 1</h3>
              <p className="text-gray-600">
                Passionate cyclist with years of experience. Loves adventure and making a difference.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl">👨‍🦱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rider 2</h3>
              <p className="text-gray-600">
                Enthusiastic about cycling and exploring new places. Ready for the challenge ahead.
              </p>
            </div>
          </div>
        </section>

        {/* The Route */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🗺️ The Route</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Our journey takes us through some of Europe's most beautiful and challenging terrains. 
              We'll be cycling through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Starting point: Belgium (Brussels)</li>
              <li>Planned countries: To be updated as we finalize our route</li>
              <li>Estimated duration: Several weeks/months</li>
              <li>Total distance: Tracking live on the map!</li>
            </ul>
            <p className="text-sm text-gray-500 italic mt-4">
              * Route details will be updated as we progress. Follow our live tracker to see where we are!
            </p>
          </div>
        </section>

        {/* The Charity */}
        <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">❤️ The Charity</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              We're riding for a cause that's very important to us. Every donation goes directly to 
              supporting [Charity Name - To be updated].
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Why This Charity?</h3>
              <p className="text-gray-600">
                Details about the charity, their mission, and why we chose to support them will be 
                added here soon. We're committed to transparency and ensuring every euro makes a real impact.
              </p>
            </div>
            <div className="text-center pt-4">
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Support Our Journey
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">How can I follow your journey?</h3>
              <p className="text-gray-600">
                Check our live tracker on the home page! We update our location automatically via GPS, 
                and we post regular updates about our experiences.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">How can I support you?</h3>
              <p className="text-gray-600">
                You can donate through any of the platforms listed on our home page. Every contribution, 
                no matter how small, makes a difference and motivates us to keep pedaling!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">How do you track your location?</h3>
              <p className="text-gray-600">
                We use OwnTracks app on our phones to automatically update our GPS location. The data is 
                displayed in real-time on our custom Mapbox map.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Will you post photos and updates?</h3>
              <p className="text-gray-600">
                Yes! Whenever we have internet connection, we'll share updates, photos, and stories from 
                our journey. Check the "Journey Updates" section on the home page.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📧 Get in Touch</h2>
          <p className="text-gray-700 mb-4">
            Want to send us a message of encouragement or have questions? We'd love to hear from you!
          </p>
          <p className="text-gray-600">
            Contact details will be added here soon.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            Following our cycling journey across Europe 🚴‍♂️
          </p>
          <p className="text-gray-400 text-sm mt-2">
            <Link href="/" className="hover:text-white">Home</Link>
            {' • '}
            <Link href="/about" className="hover:text-white">About</Link>
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}
