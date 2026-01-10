"use client"

type LoginTemplateProps = {
  children: React.ReactNode
}

const LoginTemplate = ({ children }: LoginTemplateProps) => {
  return (
    <div className="w-full flex justify-start px-8 py-8">
      {children}
    </div>
  )
}

export default LoginTemplate
