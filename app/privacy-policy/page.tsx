import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Quran Discipline",
  description:
    "Learn how Quran Discipline collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "May 18, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Quran Discipline
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: {LAST_UPDATED}
          </p>

          <Section title="1. Introduction">
            <p>
              Welcome to <strong>Quran Discipline</strong>. We are committed to
              protecting your privacy and being transparent about how we handle
              your personal information. This Privacy Policy explains what data
              we collect, how we use it, and your rights regarding that data.
            </p>
            <p>
              By using the Quran Discipline web dashboard or Chrome Extension,
              you agree to the practices described in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you authenticate
                (e.g., via OAuth), we may receive your name, email address, and
                profile picture from the identity provider.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about how
                you interact with the dashboard, including blocked sites you
                configure, verses you read, and engagement statistics.
              </li>
              <li>
                <strong>Extension Data:</strong> The Chrome Extension may
                collect data about blocked-site interactions (e.g., timestamps
                of block events) to power your statistics. This data is synced
                to your account when you are logged in.
              </li>
              <li>
                <strong>Device and Technical Data:</strong> Basic technical
                information such as browser type and operating system version
                may be collected for debugging and service improvement purposes.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data to third
              parties.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the data we collect to:</p>
            <ul>
              <li>
                Provide, maintain, and improve the Quran Discipline service.
              </li>
              <li>
                Sync your settings, blocked sites, and progress across devices.
              </li>
              <li>Display personalized engagement statistics and insights.</li>
              <li>Authenticate your identity and keep your account secure.</li>
              <li>Respond to support requests or technical issues.</li>
            </ul>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Your data is stored securely using industry-standard practices. We
              use HTTPS for all communications between the client and our
              servers. Sensitive data is stored in a secured database with
              access controls in place.
            </p>
            <p>
              While we take reasonable precautions to protect your data, no
              system is completely secure. We encourage you to use strong
              passwords and to notify us immediately if you suspect any
              unauthorized access to your account.
            </p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We integrate with the following third-party services:</p>
            <ul>
              <li>
                <strong>Quran Foundation API:</strong> Used to serve Qur'an
                verses, translations, and audio recitations. No personal data is
                shared with this service.
              </li>
              <li>
                <strong>OAuth Providers:</strong> Used for authentication. We
                only receive the profile information you authorize.
              </li>
            </ul>
            <p>
              These services have their own privacy policies, and we encourage
              you to review them.
            </p>
          </Section>

          <Section title="6. Cookies and Local Storage">
            <p>
              We use cookies and local storage to maintain your session, store
              authentication tokens, and remember your preferences. You can
              clear these at any time through your browser settings, though
              doing so may log you out of the service.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your data for as long as your account is active or as
              needed to provide our services. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict certain processing of your data.</li>
              <li>Request a portable copy of your data.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              information below.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Quran Discipline is not directed to children under the age of 13.
              We do not knowingly collect personal information from children. If
              you believe a child has provided us with their information, please
              contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the "Last updated" date at the top of this page. We
              encourage you to review this policy periodically.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please reach out to us. We are committed to
              addressing your concerns promptly and transparently.
            </p>
          </Section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} Quran Discipline. All rights reserved.
          </span>
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </section>
  );
}
