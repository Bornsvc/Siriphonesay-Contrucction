import { utils, write } from 'xlsx';
interface Workers {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  address: string;
  phone_number: string;
  purpose: string;
  created_at: string;
  gender: string;
  position: string;
  team_count: number;
  participation_count: number;
  rating: number;
  image_url?: string;
}

export const exportPatientsToExcel = (workers: Workers[]) => {
  // Prepare data for Excel format
  const worksheet = utils.json_to_sheet(
    workers.map(worker => ({
      UHID: worker.id,
      FullName: `${worker.first_name} ${worker.last_name}`,
      MiddleName: worker.middle_name,
      Dob: new Date(worker.birth_date).toLocaleDateString(),
      Age: worker.age,
      Registered: worker.created_at,
      Gender: worker.gender,
      Mobile: worker.phone_number,
      Address: worker.address,
      Purpose: worker.purpose,
      Position: worker.position,
      TeamCount: worker.team_count,
      ParticipationCount: worker.participation_count,
      Rating: worker.rating,
    }))
  );

  // Create workbook and append the worksheet
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Workers');

  // Generate buffer
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'buffer' });

  // Create blob and download
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workers_data_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};