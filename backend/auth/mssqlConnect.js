require("dotenv").config();
const sql = require("mssql");
const { formatMobileWithCountryCode, extractCountryCode, getCountryName } = require('../utils/mobileUtils');

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
      const tomorrowCondition = `MONTH(p.dDob) = MONTH(DATEADD(day, 1, GETDATE())) AND DAY(p.dDob) = DAY(DATEADD(day, 1, GETDATE()))`;
      whereConditions.push(tomorrowCondition);
      console.log('Tomorrow birthday condition:', tomorrowCondition);
      console.log('Tomorrow date:', new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString());
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

    console.log('=== QUERY CONDITIONS DEBUG ===');
    console.log('Birthday conditions:', whereConditions);
    console.log('Common conditions:', commonConditions);

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

    console.log('Executing MSSQL Query...');
    if (birthdayTomorrow) {
      console.log('Query is for TOMORROW birthdays');
    } else if (birthdayToday) {
      console.log('Query is for TODAY birthdays');
    }
    
    console.log('Final SQL Query:', query);
    
    const result = await sql.query(query);
    const patients = result.recordset;
    console.log(`MSSQL Query result: Found ${patients.length} patients`);
    console.log('=== END QUERY DEBUG ===');

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

      // Format mobile number with country code
      if (patient.mobile) {
        const originalMobile = patient.mobile;
        const countryCode = extractCountryCode(originalMobile);
        const formattedMobile = formatMobileWithCountryCode(originalMobile, '91'); // Default to India (+91)
        
        patient.mobile = formattedMobile;
        patient.countryCode = countryCode || '91';
        patient.countryName = getCountryName(countryCode || '91');
        patient.originalMobile = originalMobile; // Keep original for reference
      } else {
        patient.countryCode = null;
        patient.countryName = null;
        patient.originalMobile = null;
      }

      return patient;
    });

  } catch (err) {
    console.error("MSSQL Error:", err.message);
    return [];
  }
};

// Function specifically for UHID queries with minimal filtering
const getPatientByUHID = async (uhid) => {
  try {
    await sql.connect(config);
    
    // Minimal conditions for UHID queries - only essential checks
    const essentialConditions = [
      'p.dDob IS NOT NULL',
      'COALESCE(a.cMobile, \'\') != \'0\'',
      'COALESCE(a.cMobile, \'\') != \'\'',
      'p.iReg_No != \'-1\'',
      'ISNUMERIC(p.iReg_No) = 1',
      'ISNULL(p.bDead, 0) = 0'
    ];

    const whereClause = `WHERE p.iReg_No = ${uhid} AND ${essentialConditions.join(' AND ')}`;

    // Build the query
    let query = `
      SELECT 
        p.cPat_Name AS name, 
        p.dDob AS dob, 
        p.cSex AS gender,
        p.iReg_No AS uhid,
        COALESCE(a.cMobile, '') AS mobile
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
      ORDER BY p.iReg_No`;

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

      // Format mobile number with country code
      if (patient.mobile) {
        const originalMobile = patient.mobile;
        const countryCode = extractCountryCode(originalMobile);
        const formattedMobile = formatMobileWithCountryCode(originalMobile, '91'); // Default to India (+91)
        
        patient.mobile = formattedMobile;
        patient.countryCode = countryCode || '91';
        patient.countryName = getCountryName(countryCode || '91');
        patient.originalMobile = originalMobile; // Keep original for reference
      } else {
        patient.countryCode = null;
        patient.countryName = null;
        patient.originalMobile = null;
      }

      return patient;
    });

  } catch (err) {
    console.error("MSSQL Error:", err.message);
    return [];
  }
};

module.exports = { 
  getPatients,
  getPatientByUHID
};
