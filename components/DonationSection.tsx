'use client';

export default function DonationSection() {
  const donationPlatforms = [
    {
      name: 'GoFundMe',
      icon: '💚',
      url: '#',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'JustGiving',
      icon: '💙',
      url: '#',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'PayPal',
      icon: '💛',
      url: '#',
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-lg shadow-xl">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚴‍♂️ Support Our Journey
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          We're cycling across Europe to raise money for charity. Every contribution makes a difference 
          and helps us reach our goal. Thank you for your support!
        </p>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>€0 raised</span>
            <span>Goal: €10,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Update your fundraising goal and progress in the admin panel
          </p>
        </div>

        {/* Donation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {donationPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span>Donate via {platform.name}</span>
            </a>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">About the Charity</h3>
          <p className="text-gray-600 text-sm">
            We're riding for a cause close to our hearts. More details about the charity 
            and our mission will be added soon. Thank you for your patience and support!
          </p>
        </div>
      </div>
    </div>
  );
}
