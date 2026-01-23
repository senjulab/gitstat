"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white tracking-tight">
      <Navbar />

      <main className="flex-1 pt-44 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-4xl font-medium text-[#181925] mb-4 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-base text-[#666] font-normal">
              The rules and guidelines for using GitStat
            </p>
          </div>

          {/* Content */}
          <div className="prose-style">
            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Acceptance of Terms
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                By accessing or using GitStat, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Description of Service
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                GitStat provides analytics and insights for GitHub repositories, including tracking of stars, commits, traffic, and contributor activity. Our service integrates with GitHub's API to provide you with real-time and historical data about your repositories.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Your Account and GitHub
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                To use GitStat, you must connect your GitHub account through OAuth authorization. You are responsible for maintaining the security of your account and any activities that occur under your account. You must have the necessary permissions to access and analyze the repositories you connect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Acceptable Use
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                You agree not to use GitStat for any unlawful purpose or in any way that could damage, disable, or impair our service. You may not attempt to gain unauthorized access to any part of the service, other accounts, or any systems or networks connected to our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Intellectual Property
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                GitStat and its original content, features, and functionality are owned by GitStat and are protected by international copyright, trademark, and other intellectual property laws. Your repository data remains yours; we claim no ownership over your code or repository content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Limitation of Liability
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                GitStat shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We provide the service "as is" without warranties of any kind, either express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Changes to Terms
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                We reserve the right to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-[#181925] mt-10 mb-3 tracking-tight">
                Contact
              </h2>
              <p className="text-[#666] text-base leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at legal@gitstat.dev.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
