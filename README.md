# GitStat

> **Understand how your git repos grow.**  
> An open-source alternative to GitHub Insights.

GitStat makes GitHub repo analytics simple. Track stars, commits, traffic, and contributors to understand how your repo evolves in real-time.


## Features

- **Real-time Tracking**: Monitor traffic, commits, stars, and contributors as they happen.
- **Contributor Insights**: See who is pushing code, opening pull requests, and keeping your project alive.
- **Unified Dashboard**: Track all your projects from one place.
- **Beautiful UI**: Built with Next.js, Tailwind CSS, and Recharts for a seamless experience.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Base UI](https://base-ui.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [HugeIcons](https://hugeicons.com/) & [Lucide](https://lucide.dev/)
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A [Supabase](https://supabase.com/) project.
- A GitHub App (for fetching repository data).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/gitstat.git
    cd gitstat
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Rename the example environment file (or create a new one):

    ```bash
    cp .env.local.example .env.local
    ```

    Fill in your Supabase and GitHub credentials in `.env.local`.

4.  **Run the development server:**

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
