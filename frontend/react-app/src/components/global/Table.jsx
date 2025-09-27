import { FaEdit, FaTrash } from "react-icons/fa";

export default function Table({ columns, data, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
            <th> Actions </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col}>
                  {item[col.toLowerCase().replace(/\s/g, "")]}
                </td>
              ))}
              <td className="actions-cell">
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEdit(item)}
                >
                  <FaEdit />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDelete(item)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
