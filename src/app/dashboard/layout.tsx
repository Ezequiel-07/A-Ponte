import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, LogOut, Menu, User, Handshake } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { auth } from "@/lib/firebase/client";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Conexões", href: "/dashboard/connections", icon: Handshake },
    { label: "Perfil", href: "/dashboard/profile", icon: User },
];

function SidebarNav() {
    return (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
                <Button key={item.label} variant="ghost" className="justify-start gap-2" asChild>
                    <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}

function UserMenu() {
    const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        {avatar && <AvatarImage src={avatar.imageUrl} alt="User Avatar" data-ai-hint={avatar.imageHint} />}
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Usuário</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {auth.currentUser?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    auth.signOut();
                    window.location.href = '/auth';
                }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-card lg:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-20 items-center border-b px-6">
                        <Link href="/dashboard">
                            <Logo />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                       <SidebarNav />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-20 items-center gap-4 border-b bg-card px-6">
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <div className="flex h-20 items-center border-b px-6 -ml-6 -mr-6">
                                <Link href="/dashboard">
                                    <Logo />
                                </Link>
                            </div>
                            <SidebarNav />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                       {/* Can add breadcrumbs or search here */}
                    </div>
                    <UserMenu />
                </header>
                <main className="flex-1 overflow-y-auto bg-secondary p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
