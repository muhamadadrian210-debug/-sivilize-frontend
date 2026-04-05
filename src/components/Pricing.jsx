import React, { useState } from 'react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: billingCycle === 'monthly' ? 0 : 0,
      yearlyPrice: 0,
      features: [
        '5 RAB calculations per month',
        'Basic templates',
        'Local storage only',
        'Email support',
        'Mobile access',
        'Standard export formats'
      ],
      notIncluded: [
        'Cloud storage',
        'Advanced templates',
        'Priority support',
        'Team collaboration',
        'API access',
        'Custom branding'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'Professional',
      description: 'For serious contractors & engineers',
      price: billingCycle === 'monthly' ? 149000 : 1490000,
      yearlyPrice: 1490000,
      features: [
        'Unlimited RAB calculations',
        'All templates included',
        'Cloud storage (10GB)',
        'Priority email support',
        'Mobile & desktop access',
        'Advanced export formats',
        'Project history & analytics',
        'Team collaboration (5 users)',
        'Custom templates',
        'API access'
      ],
      notIncluded: [
        'White-label branding',
        'Dedicated account manager',
        'Custom integrations'
      ],
      color: 'orange',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large construction companies',
      price: billingCycle === 'monthly' ? 499000 : 4990000,
      yearlyPrice: 4990000,
      features: [
        'Everything in Professional',
        'Unlimited cloud storage',
        'Dedicated account manager',
        'Phone & video support',
        'White-label branding',
        'Custom integrations',
        'Unlimited team members',
        'Advanced analytics dashboard',
        'Custom workflows',
        'SLA guarantee',
        'On-premise deployment option'
      ],
      notIncluded: [],
      color: 'purple',
      popular: false
    }
  ];

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your construction business
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-600">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                          plan.color === 'orange' ? 'text-orange-500' :
                          plan.color === 'purple' ? 'text-purple-500' :
                          'text-gray-500'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start opacity-50">
                      <svg
                        className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : plan.color === 'purple'
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                All paid plans come with a 14-day free trial. No credit card required for the free plan.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept bank transfer, credit/debit cards, and major e-wallets in Indonesia.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes! We use industry-standard encryption and security measures to protect your data.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to streamline your RAB calculations?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of contractors and engineers already using SIVILIZE-HUB PRO
          </p>
          <button className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
