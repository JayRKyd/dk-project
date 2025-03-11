import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface BookingForm {
  date: string;
  time: string;
  duration: string;
  name: string;
  email: string;
  phone: string;
  location: 'incall' | 'outcall';
  address?: string;
  message?: string;
  selectedServices: string[];
}

interface Service {
  name: string;
  price: string | 'Included';
}

const services: Service[] = [
  { name: 'Girlfriend Experience', price: 'Included' },
  { name: 'Striptease', price: 'Included' },
  { name: 'Fingering', price: 'Included' },
  { name: 'Handjob', price: 'Included' },
  { name: 'Kissing', price: 'Included' },
  { name: 'French kissing', price: '€ 20,-' },
  { name: 'Pussy licking', price: 'Included' },
  { name: 'Rimming (me)', price: 'Included' },
  { name: 'Rimming (client)', price: '€ 20,-' },
  { name: 'Blowjob with condom', price: 'Included' },
  { name: 'Blowjob without condom', price: 'Included' },
  { name: 'Deep Throat', price: 'Included' },
  { name: 'Sex with condom', price: 'Included' },
  { name: 'Sex without condom', price: '€ 50,-' },
  { name: 'Relaxing Massage', price: 'Included' },
  { name: 'Erotic Massage', price: 'Included' },
  { name: 'Anal Massage', price: '€ 30,-' },
  { name: 'Dildo (me)', price: 'Included' },
  { name: 'Dildo (client)', price: 'Included' },
  { name: 'Trio MFF', price: 'Included' },
  { name: 'Trio MMF', price: 'Included' },
  { name: 'Groupsex', price: '€ 50,-' },
  { name: "Photo's", price: '€ 50,-' },
  { name: 'Video', price: '€ 100,-' },
  { name: 'High Heels', price: 'Included' },
  { name: 'Role Play', price: 'Included' },
  { name: 'Soft SM', price: 'Included' },
  { name: 'BDSM', price: '€ 50,-' },
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingForm>({
    date: '',
    time: '',
    duration: '1 hour',
    name: '',
    email: '',
    phone: '',
    location: 'incall',
    selectedServices: [],
  });

  const toggleService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceName)
        ? prev.selectedServices.filter(s => s !== serviceName)
        : [...prev.selectedServices, serviceName]
    }));
  };

  const calculateExtraServicesCost = () => {
    return formData.selectedServices.reduce((total, serviceName) => {
      const service = services.find(s => s.name === serviceName);
      if (service && service.price !== 'Included') {
        return total + parseInt(service.price.replace(/[^0-9]/g, ''));
      }
      return total;
    }, 0);
  };

  const getDurationBaseCost = () => {
    switch (formData.duration) {
      case '15 min': return 50;
      case '30 min': return 100;
      case '1 hour': return 130;
      case '2 hours': return 250;
      case 'night': return 600;
      default: return 0;
    }
  };

  const totalCost = getDurationBaseCost() + calculateExtraServicesCost() + 
    (formData.location === 'outcall' ? 50 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    // Handle booking submission
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <Link
            to={`/ladies/pro/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Advertisement</span>
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <img
            src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80"
            alt="Melissa"
            className="w-24 h-24 rounded-full object-cover border-4 border-pink-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Book Appointment with{' '}
              <Link to="/ladies/pro/melissa" className="text-pink-500 hover:text-pink-600 transition-colors">
                Melissa
              </Link>
            </h1>
            <p className="text-gray-600 mt-1">
              <span className="text-pink-500 font-medium">Available today</span> • Utrecht, Netherlands
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setFormData({ 
                      ...formData, 
                      date: today.toISOString().split('T')[0] 
                    });
                  }}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    formData.date === new Date().toISOString().split('T')[0]
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  <div className="font-medium">Today</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setFormData({ 
                      ...formData, 
                      date: tomorrow.toISOString().split('T')[0] 
                    });
                  }}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    formData.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  <div className="font-medium">Tomorrow</div>
                </button>
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-3 w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({ ...formData, time })}
                    className={`p-2 rounded-lg text-center transition-colors ${
                      formData.time === time
                        ? 'bg-pink-500 text-white'
                        : 'bg-pink-50 hover:bg-pink-100'
                    }`}
                  >
                    <div className="text-sm">{time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Date/Time Summary */}
          {(formData.date || formData.time) && (
            <div className="mt-4 bg-pink-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-700">
                {formData.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    <span>
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {formData.date && formData.time && (
                  <span className="text-gray-400 mx-2">•</span>
                )}
                {formData.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-pink-500" />
                    <span>{formData.time}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration of the Date
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
            >
              <option value="15 min">15 minutes (€50)</option>
              <option value="30 min">30 minutes (€100)</option>
              <option value="1 hour">1 hour (€130)</option>
              <option value="2 hours">2 hours (€250)</option>
              <option value="night">Night (€600)</option>
            </select>
          </div>

          {/* Services Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Services
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {services.map((service) => (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => toggleService(service.name)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    formData.selectedServices.includes(service.name)
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formData.selectedServices.includes(service.name) ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    <span>{service.name}</span>
                  </div>
                  <span className={`text-sm ${
                    formData.selectedServices.includes(service.name)
                      ? 'text-white'
                      : service.price === 'Included' ? 'text-green-600' : 'text-pink-500'
                  }`}>
                    {service.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Total Cost:</span>
              <span className="text-pink-500">€ {totalCost},-</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div>Base price ({formData.duration}): € {getDurationBaseCost()},-</div>
              {calculateExtraServicesCost() > 0 && (
                <div>Extra services: € {calculateExtraServicesCost()},-</div>
              )}
              {formData.location === 'outcall' && (
                <div>Travel fee: € 50,-</div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'incall' })}
                className={`p-4 rounded-lg text-center transition-colors ${
                  formData.location === 'incall'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 hover:bg-pink-100'
                }`}
              >
                <MapPin className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Visit Me</div>
                <div className="text-sm opacity-75">Keizersgracht, Amsterdam</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location: 'outcall' })}
                className={`p-4 rounded-lg text-center transition-colors ${
                  formData.location === 'outcall'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 hover:bg-pink-100'
                }`}
              >
                <MapPin className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">I Visit You</div>
                <div className="text-sm opacity-75">+€50 travel fee</div>
              </button>
            </div>
          </div>

          {/* Address for outcall */}
          {formData.location === 'outcall' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Please provide your address or hotel details"
                required
              />
            </div>
          )}

          {/* Additional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Any special requests or notes?"
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-pink-100 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-start gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-pink-500 mt-1" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div>
                    {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not selected'}{' '}
                    {formData.time && `at ${formData.time}`}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3 text-gray-700">
                <Clock className="h-5 w-5 text-pink-500 mt-1" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div>{formData.duration}</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-pink-500 mt-1" />
                <div>
                  <div className="font-medium">Location</div>
                  <div>
                    {formData.location === 'incall' 
                      ? 'Visit at Keizersgracht, Amsterdam'
                      : 'Outcall service (+€50 travel fee)'}
                  </div>
                  {formData.location === 'outcall' && formData.address && (
                    <div className="text-sm mt-1">{formData.address}</div>
                  )}
                </div>
              </div>

              {/* Selected Services */}
              {formData.selectedServices.length > 0 && (
                <div className="border-t border-pink-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.selectedServices.map(serviceName => {
                      const service = services.find(s => s.name === serviceName);
                      return (
                        <div key={serviceName} className="flex justify-between items-center text-gray-700">
                          <span>{serviceName}</span>
                          <span className={service?.price === 'Included' ? 'text-green-600' : 'text-pink-500'}>
                            {service?.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="border-t border-pink-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Base price ({formData.duration})</span>
                    <span>€ {getDurationBaseCost()},-</span>
                  </div>
                  {calculateExtraServicesCost() > 0 && (
                    <div className="flex justify-between">
                      <span>Extra services</span>
                      <span>€ {calculateExtraServicesCost()},-</span>
                    </div>
                  )}
                  {formData.location === 'outcall' && (
                    <div className="flex justify-between">
                      <span>Travel fee</span>
                      <span>€ 50,-</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-pink-200">
                    <span>Total</span>
                    <span className="text-pink-500">€ {totalCost},-</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-pink-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Contact Information</h4>
                <div className="space-y-1 text-gray-700">
                  <div>Name: {formData.name || 'Not provided'}</div>
                  <div>Phone: {formData.phone || 'Not provided'}</div>
                  <div>Email: {formData.email || 'Not provided'}</div>
                  {formData.message && (
                    <div className="mt-2">
                      <div className="font-medium">Additional Message:</div>
                      <div className="text-sm mt-1">{formData.message}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Confirm Booking
          </button>

          {/* Terms and Privacy */}
          <p className="text-sm text-gray-500 text-center">
            By booking an appointment you agree to our{' '}
            <a href="/terms" className="text-pink-500 hover:text-pink-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-pink-500 hover:text-pink-600">
              Privacy Policy
            </a>
          </p>
        </form>

        {/* FAQ Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">How do I pay?</h3>
              <p className="text-gray-600">
                Payment is made in cash at the beginning of our meeting. Please ensure you have the exact amount.
                All prices are in euros (€).
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What happens after I book?</h3>
              <p className="text-gray-600">
                You'll receive an SMS confirmation with the booking details. I'll contact you directly
                to confirm the appointment and provide the exact address (for incall) or discuss location details
                (for outcall).
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What should I bring?</h3>
              <p className="text-gray-600">
                Please bring the agreed payment in cash and ensure good personal hygiene. For outcalls,
                I'll let you know if there are any specific requirements for the location.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Can I modify my booking?</h3>
              <p className="text-gray-600">
                Yes, you can modify or cancel your booking up to 2 hours before the appointment time.
                Simply contact me using the provided phone number in your confirmation SMS.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Is my privacy protected?</h3>
              <p className="text-gray-600">
                Absolutely! Your personal information and booking details are kept strictly confidential.
                I never share or store sensitive information, and all communication is discrete.
              </p>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What about extra services?</h3>
              <p className="text-gray-600">
                Any extra services must be agreed upon during booking and paid for in addition to the base rate.
                All available services and their prices are listed in the services section above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}