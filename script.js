function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Lista de Usuários", 10, 10);

    let rows = [];
    document.querySelectorAll("#userTable tbody tr").forEach(row => {
        let rowData = [];
        row.querySelectorAll("td").forEach(cell => {
            rowData.push(cell.textContent);
        });
        rows.push(rowData);
    });

    doc.autoTable({
        head: [['ID', 'Nome', 'Email', 'Avatar', 'Detalhar', 'Excluir']],
        body: rows
    });
    doc.save('usuarios.pdf');
}

function exportToCSV() {
    const table = document.getElementById('userTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
    const csvData = XLSX.utils.sheet_to_csv(wb.Sheets.Sheet1);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'usuarios.csv';
    link.click();
}

function exportToExcel() {
    const table = document.getElementById('userTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
    XLSX.writeFile(wb, 'usuarios.xlsx');
}

function confirmDelete() {
    fetch(`https://reqres.in/api/users/${deleteUserId}`, {
        method: 'DELETE'
    })
        .then(() => {
            closeDeleteModal();
        })
        .catch(error => console.error('Erro ao excluir o usuário:', error));
}

function addUser() {
    const firstName = document.getElementById('addFirstName').value;
    const lastName = document.getElementById('addLastName').value;
    const email = document.getElementById('addEmail').value;

    const newUser = {
        first_name: firstName,
        last_name: lastName,
        email: email
    };

    fetch('https://reqres.in/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            closeAddUserModal();
        })
        .catch(error => console.error('Erro ao adicionar o usuário:', error));
}

let currentUserId = null;
let deleteUserId = null;

function fetchUsers() {
    fetch('https://reqres.in/api/users?page=2')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('userTableBody');
            data.data.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', user.id);
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.first_name} ${user.last_name}</td>
                    <td>${user.email}</td>
                    <td><img src="${user.avatar}" alt="${user.first_name}"></td>
                    <td><i class="fas fa-info-circle action-btn detail" onclick="detailUser(${user.id})"></i></td>
                    <td><i class="fas fa-trash action-btn delete" onclick="openDeleteModal(${user.id})"></i></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao buscar usuários:', error));
}

function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const name = cells[1].textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();

        if (name.indexOf(filter) > -1 || email.indexOf(filter) > -1) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function detailUser(userId) {
    currentUserId = userId;
    fetch(`https://reqres.in/api/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('userAvatar').src = data.data.avatar;
            document.getElementById('firstName').value = data.data.first_name;
            document.getElementById('lastName').value = data.data.last_name;
            document.getElementById('email').value = data.data.email;
            document.getElementById('userModal').style.display = 'block';
        })
        .catch(error => console.error('Erro ao carregar os detalhes do usuário:', error));
}

function updateUser() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;

    const updatedData = {
        first_name: firstName,
        last_name: lastName,
        email: email
    };

    fetch(`https://reqres.in/api/users/${currentUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => response.json())
        .then(data => {
            alert('Usuário atualizado com sucesso!');
            closeModal();
            location.reload(); 
        })
        .catch(error => console.error('Erro ao atualizar o usuário:', error));
}

function openDeleteModal(userId) {
    deleteUserId = userId;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

function openExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function exportToExcelType(type) {
    if (type === 'xlsx') {
        exportToExcel();
    } else {
        exportToCSV();
    }
    closeExportModal();
}

function openAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

window.onload = fetchUsers;