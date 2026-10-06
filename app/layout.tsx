import type { Metadata } from 'next';
import './globals.css';
import './dense.css';
import './mobile.css';
import './refinements.css';
export const metadata:Metadata={title:'국립목포대학교 조경학과 일정실',description:'교수와 조교가 함께 관리하는 학과 행사 일정',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko" className="dark" suppressHydrationWarning><body>{children}</body></html>}
