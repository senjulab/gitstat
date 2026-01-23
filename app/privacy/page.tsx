"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white tracking-tight">
      <Navbar />

      <main className="flex-1 pt-44 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-4xl font-medium text-[#181925] mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-base text-[#666] font-normal">
              How we collect, use, and protect your information
            </p>
          </div>

          {/* Content */}
          <div className="prose-style">
            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Introduction
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                At GitStat, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. Please read this policy carefully. By using GitStat, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Data We Collect
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, connect your GitHub account, or contact us for support. This includes your email address, GitHub username, and repository metadata. We do not store your source code.
              </p>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                We also automatically collect certain information when you use our service, including your IP address, browser type, and usage patterns to improve our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                How We Use Your Data
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services, to communicate with you about your account, and to send you technical notices and support messages. We also use your data to generate analytics and insights about your repositories.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Data Sharing
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as hosting and analytics. These providers are bound by contractual obligations to keep your information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Your Rights
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                You have the right to access, correct, or delete your personal information at any time. You can disconnect your GitHub account and delete your GitStat account through your settings. Upon deletion, we will remove your data from our systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Contact
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us at privacy@gitstat.dev.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
