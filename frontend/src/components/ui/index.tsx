import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Button({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props} /> }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select className="input" {...props} /> }
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`card ${className}`} {...props} /> }
export function Badge({ children, status = 'draft' }: { children: ReactNode; status?: string }) { return <span className={`badge badge-${status.replaceAll(' ', '-')}`}>{children}</span> }
export function Empty({ message = 'Nothing here yet.' }: { message?: string }) { return <div className="empty">{message}</div> }
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
export function Table({ columns, rows, onRow }: { columns: string[]; rows: ReactNode[][]; onRow?: (index: number) => void }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} onClick={() => onRow?.(i)} className={onRow ? 'clickable' : ''}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <Empty message="No records match your filters." />}</div>
}
