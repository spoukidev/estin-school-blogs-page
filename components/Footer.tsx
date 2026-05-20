import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-primary-900 border-t border-primary-200 dark:border-primary-800 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="relative w-10 h-10">
                            <img
                                src="/logo.png"
                                alt="Estin Blog Logo"
                                className="object-contain w-full h-full dark:brightness-0 dark:invert"
                            />
                        </div>
                        <span className="text-xl font-bold text-primary-900 dark:text-white">
                            Estin Blog
                        </span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link href="#" className="text-primary-500 hover:text-accent-600 dark:text-primary-400 dark:hover:text-accent-400 transition-colors">
                            <FaGithub className="text-xl" />
                        </Link>
                        <Link href="#" className="text-primary-500 hover:text-accent-600 dark:text-primary-400 dark:hover:text-accent-400 transition-colors">
                            <FaTwitter className="text-xl" />
                        </Link>
                        <Link href="#" className="text-primary-500 hover:text-accent-600 dark:text-primary-400 dark:hover:text-accent-400 transition-colors">
                            <FaLinkedin className="text-xl" />
                        </Link>
                    </div>

                    <p className="text-primary-500 dark:text-primary-400 text-sm">
                        © {new Date().getFullYear()} Estin Blog. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
