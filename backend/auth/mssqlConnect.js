require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASS,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};


// Universal function to get patients with all required details
const getPatients = async (options = {}) => {
  try {
    await sql.connect(config);
    
    const {
      uhid = null,
      dob = null,
      birthdayToday = false,
      birthdayTomorrow = false,
      limit = null
    } = options;

    let whereConditions = [];
    let orderBy = 'ORDER BY p.iReg_No';

    // Build WHERE conditions based on options
    if (uhid) {
      whereConditions.push(`p.iReg_No = ${uhid}`);
    }

    if (dob) {
      whereConditions.push(`CAST(p.dDob AS DATE) = CAST('${dob}' AS DATE)`);
    }

    if (birthdayToday) {
      whereConditions.push(`MONTH(p.dDob) = MONTH(GETDATE()) AND DAY(p.dDob) = DAY(GETDATE())`);
    }

    if (birthdayTomorrow) {
      whereConditions.push(`MONTH(p.dDob) = MONTH(DATEADD(day, 1, GETDATE())) AND DAY(p.dDob) = DAY(DATEADD(day, 1, GETDATE()))`);
    }


    // Common conditions for all queries
    const commonConditions = [
      'YEAR(dCreate_dt) >= 2024',
      'p.dDob IS NOT NULL',
      'COALESCE(a.cMobile, \'\') != \'0\'',
      'COALESCE(a.cMobile, \'\') != \'\'',
      'p.iReg_No != \'-1\'',
      'ISNUMERIC(p.iReg_No) = 1',
      'ISNULL(p.bDead, 0) = 0',
      'DATEDIFF(year, p.dDob, GETDATE()) BETWEEN 10 AND 50'
    ];

    // Combine all conditions
    const allConditions = [...whereConditions, ...commonConditions];
    const whereClause = allConditions.length > 0 ? `WHERE ${allConditions.join(' AND ')}` : '';

    // Build the query
    let query = `
      SELECT 
        p.cPat_Name AS name, 
        p.dDob AS dob, 
        p.cSex AS gender,
        p.iReg_No AS uhid,
        COALESCE(a.cMobile, '') AS mobile`;


    query += `
      FROM Mast_Patient p
      LEFT JOIN (
        SELECT 
          iPat_id, 
          MIN(CASE WHEN cMobile != '0' AND cMobile != '' THEN cMobile END) as cMobile
        FROM Mast_Pat_Addr 
        WHERE cMobile != '0' AND cMobile != ''
        GROUP BY iPat_id
      ) a ON p.iPat_id = a.iPat_id
      ${whereClause}
      ${orderBy}`;

    // Add LIMIT if specified
    if (limit) {
      query += ` OFFSET 0 ROWS FETCH NEXT ${limit} ROWS ONLY`;
    }

    const result = await sql.query(query);
    const patients = result.recordset;

    return patients.map(patient => {
      // Convert gender codes to readable format
      if (patient.gender === "F") patient.gender = "Female";
      else if (patient.gender === "M") patient.gender = "Male";

      // Calculate age
      if (patient.dob) {
        const dobDate = new Date(patient.dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        patient.age = age;
      } else {
        patient.age = null;
      }

      return patient;
    });

  } catch (err) {
    console.error("MSSQL Error:", err.message);
    return [];
  }
};

module.exports = { 
  getPatients
};
