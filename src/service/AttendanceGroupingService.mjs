// import AttendanceGroupingDateRepository from "../repository/AttendanceGroupingDateRepository.mjs";

function formatDate(dateString, delimiter = '-') {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth()는 0부터 시작하므로 1을 더해줍니다.
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${delimiter}${month}${delimiter}${day}`;
}

export default class AttendanceGroupingService {
  static async groupingByDate(list) {
    const groupedByDate = list.reduce((acc, { eventDateTime }) => {
      const formattedDate = formatDate(eventDateTime);

      if (acc[formattedDate]) {
        acc[formattedDate]++;
      } else {
        acc[formattedDate] = 1;
      }

      return acc;
    }, {}); // 초기 누적기는 빈 객체입니다.

    console.log("groupedByDate: " + JSON.stringify(groupedByDate));

  }
}
