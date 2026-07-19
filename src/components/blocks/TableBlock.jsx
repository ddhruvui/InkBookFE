// Full-width table — first row is the header strip.
export default function TableBlock({ block }) {
  const rows = block.payload.rows || []
  return (
    <table className="table-block">
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
