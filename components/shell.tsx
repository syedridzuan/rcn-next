interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6" {...props}>
      {children}
    </div>
  )
} 


interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div className="w-full py-6 md:py-10 lg:py-12 space-y-6 md:space-y-8 lg:space-y-10" {...props}>
      {children}
    </div>
  )
}

