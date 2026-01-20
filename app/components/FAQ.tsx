import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is GitHub repo analytics?",
    answer:
      "GitHub repo analytics helps you understand how your repositories grow over time by tracking stars, commits, traffic, and contributor activity.",
  },
  {
    question: "How is this different from GitHub Insights?",
    answer:
      "We provide deeper analytics, historical data retention, and real-time tracking that goes beyond what GitHub's built-in insights offer.",
  },
  {
    question: "Is my repository data secure?",
    answer:
      "Yes, we only access public repository data or data you explicitly authorize. We never store your code.",
  },
  {
    question: "How long is data retained?",
    answer:
      "We retain your analytics data for as long as your account is active, with historical data going back to when you first connected.",
  },
  {
    question: "Can I track private repositories?",
    answer:
      "Yes, with proper GitHub authorization you can track both public and private repositories.",
  },
  {
    question: "Can I track multiple repositories?",
    answer:
      "Absolutely! You can connect and track as many repositories as your plan allows.",
  },
  {
    question: "How do I connect my GitHub account?",
    answer:
      "Simply click the Register button and authorize with GitHub. We'll automatically detect your repositories.",
  },
  {
    question: "Can I export my analytics data?",
    answer:
      "Yes, all plans include the ability to export your data in CSV or JSON format.",
  },
  {
    question: "What metrics are tracked?",
    answer:
      "We track stars, forks, commits, pull requests, issues, traffic, clones, and contributor activity.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes, we offer a 14-day free trial with full access to all features. No credit card required.",
  },
];

export default function FAQ() {
  return (
    <div className="py-16 md:py-24 bg-background tracking-tight">
      <div className="w-full max-w-3xl mx-auto px-5 flex flex-col items-center gap-8">
        <span className="text-sm text-[#0006] border-transparent h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 pl-2 pr-2 gap-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
          FAQ
        </span>
        <h2 className="text-4xl md:text-5xl font-medium text-[#181925] text-center tracking-tight leading-tight text-balance max-w-md">
          Frequently
          <br />
          asked questions
        </h2>
        <p className="text-[#666] text-center tracking-tight text-lg/6 w-full max-w-sm font-medium">
          Got questions? We've got answers about tracking your GitHub repos.
        </p>

        <Accordion className="w-full max-w-xl flex flex-col gap-2 mt-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[#00000008] rounded-xl overflow-hidden border-0"
            >
              <AccordionTrigger className="w-full text-foreground-4 focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-between gap-4 pl-4 pr-3 py-2.5 text-left font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer">
                <span className="text-[#181925] font-medium">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionPanel className="px-5 pb-4 pt-0">
                <p className="text-[#666]">{faq.answer}</p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
