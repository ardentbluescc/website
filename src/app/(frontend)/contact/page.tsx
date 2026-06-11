import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Ardent Blues CC',
  description: 'Get in touch with Ardent Blues Cricket Club.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-5xl font-normal text-white mb-4">Get in Touch</h1>
        <p className="text-gray-400 text-lg mb-12">
          Questions about membership, training, or anything else? We&apos;d love to hear from you.
        </p>

        <form className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <input
                type="text"
                className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
              <input
                type="text"
                className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
                placeholder="Smith"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
            <select className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-ardent transition-colors">
              <option value="">Select a topic</option>
              <option value="membership">Membership Enquiry</option>
              <option value="training">Training &amp; Coaching</option>
              <option value="sponsorship">Sponsorship</option>
              <option value="general">General Enquiry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
            <textarea
              rows={5}
              className="w-full bg-ardent-card border border-ardent-border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-ardent transition-colors resize-none"
              placeholder="Tell us how we can help..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-ardent hover:bg-ardent-light text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-ardent/20 text-sm"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
