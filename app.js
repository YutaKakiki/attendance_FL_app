// express、mysqlの読み込み
const express = require('express');
const app = express();
const mysql = require('mysql');

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// mysqlの接続情報を設定
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Uta12242002',
  database: 'attendance',
  timezone: 'utc'
});

// 接続できなかったときにエラー表示
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('You can connect mysql');
});

// フォームを受け取るためのコード（これにより、req.bodyを通じてフォームにアクセス可能に。）
app.use(express.urlencoded({ extended: false }));

// EJSテンプレートエンジンを設定
app.set('view engine', 'ejs'); 


// ホーム画面（従業員一覧画面）のルーティング
//home.ejs（ホーム画面＝従業員一覧の画面がはじめに呼び出される）
app.get('/', (req, res) => {
  // employeesテーブルから従業員を取得
  connection.query('SELECT * FROM employees order by id', (error, results) => {
    if (error) {
      console.error('従業員の取得中にエラーが発生しました' + error);
      res.status(500).send('従業員の取得中にエラーが発生しました');
    } else {
      res.render('home.ejs', { employees: results});
    }
  });
});


// 従業員登録画面のルーティング
app.get('/registration', (req, res) => {
  res.render('registration.ejs');
});


// 従業員を登録する
app.post('/add', (req, res) => {
  // フォームから値を取得
  const addedName = req.body.addedName;
  connection.query('INSERT INTO employees (name) VALUES (?)', [addedName], (error, results) => {
    if (error) {
      console.error('従業員の追加中にエラーが発生しました: ' + error);
      res.status(500).send('従業員の追加中にエラーが発生しました');
    } else {
      res.redirect('/');
    }
  });
});


// 従業員を削除する
app.post('/delete/:id', (req, res) => {
  connection.query('DELETE FROM employees WHERE id = ?', [req.params.id], (error, results) => {
    if (error) {
      console.error('従業員の削除中にエラーが発生しました: ' + error);
      res.status(500).send('従業員の削除中にエラーが発生しました');
    } else {
      res.redirect('/');
    }
  });
});


// 従業員名編集画面のル―ティング
// フォーム内に、既存の名前を表示しておくためにemplyeesテーブルから値を渡す。
app.get('/edit/:id', (req, res) => {
  connection.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (error, results) => {
    res.render('edit.ejs', { employee: results });
  });
});

// 従業員名の編集（更新）
app.post('/update/:id', (req, res) => {
  // フォームの値を受け取る
  const employeeName = req.body.employeeName;
  connection.query('UPDATE employees SET name = ? WHERE id = ?', [employeeName, req.params.id], (error, results) => {
    res.redirect('/');
  });
});


// 従業員ごとの勤怠打刻画面へのルーティング
// 指定の従業員を表示させるためにemployeesテーブルの値を渡す
app.get('/attendance/:id', (req, res) => {
  connection.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (error, results) => {
  res.render('attendance.ejs', { employee: results});
  });
});


//出勤ボタンを押すとDBのrecordsテーブルに打刻情報を挿入
app.post('/check_in/:id', (req, res) => {
  const employeeId = req.params.id;
  connection.query('INSERT INTO records (id, check_in, break_start, break_end, check_out, dateRecord) VALUES (?, now(), "00:00:00", "00:00:00","00:00:00",now())', [employeeId], (error, results) => {
    if (error) {
      console.error('出勤レコードの挿入中にエラーが発生しました: ' + error);
      res.status(500).send('出勤レコードの挿入中にエラーが発生しました');
    } else {
      console.log('出勤レコードが正常に挿入されました。');
      res.redirect(`/attendance/${employeeId}`);
    }
  });
});

// 休憩開始を押すとDBのrecordsテーブルに打刻情報を挿入
app.post('/break_start/:id', (req, res) => {
  const employeeId = req.params.id;

  connection.query('INSERT INTO records (id, check_in, break_start, break_end, check_out, dateRecord) VALUES (?,"00:00:00",now(),"00:00:00","00:00:00", now())', [employeeId], (error, results) => {
    if (error) {
      console.error('休憩開始レコードの挿入中にエラーが発生しました: ' + error);
      res.status(500).send('休憩開始レコードの挿入中にエラーが発生しました');
    } else {
      console.log('休憩開始レコードが正常に挿入されました。');
      res.redirect(`/attendance/${employeeId}`);
    }
  });
});

// 休憩終了を押すとDBのrecordsテーブルに打刻情報を挿入
app.post('/break_end/:id', (req, res) => {
  const employeeId = req.params.id;

  connection.query('INSERT INTO records (id, check_in, break_start, break_end, check_out, dateRecord) VALUES (?, "00:00:00","00:00:00", now(),"00:00:00", now())', [employeeId], (error, results) => {
    if (error) {
      console.error('休憩終了レコードの挿入中にエラーが発生しました: ' + error);
      res.status(500).send('休憩終了レコードの挿入中にエラーが発生しました');
    } else {
      console.log('休憩終了レコードが正常に挿入されました。');
      res.redirect(`/attendance/${employeeId}`);
    }
  });
});


// 退勤を押すとDBのrecordsテーブルに打刻情報を挿入
app.post('/check_out/:id', (req, res) => {
  const employeeId = req.params.id;

  connection.query('INSERT INTO records (id, check_in, break_start, break_end, check_out, dateRecord) VALUES (?, "00:00:00","00:00:00","00:00:00",now(), now())', [employeeId], (error, results) => {
    if (error) {
      console.error('退勤レコードの挿入中にエラーが発生しました: ' + error);
      res.status(500).send('退勤レコードの挿入中にエラーが発生しました');
    } else {
      console.log('退勤レコードが正常に挿入されました。');
      res.redirect(`/attendance/${employeeId}`);
    }
  });
});


// 管理者画面へのルート
app.get("/management", (req, res) => {
  // 従業員ごとの労働時間と給与情報をcalculationテーブルから取得（→ページに表示）
  const salaryQuery = `
    SELECT calculation.id, employees.name, employees.id, calculation.workTime, calculation.salary
    FROM calculation
    JOIN employees ON calculation.id = employees.id
    order by employees.id;
  `;

  // 月ごとの人件費を取得
  const monthlyLaborQuery = `select year,month,sum(labor) as monthlyLabor from laborSum where year=year(now()) group by year,month order by year,month;`;

  // 年ごとの合計人件費を取得
  const yearlyLaborQuery = `select year,sum(labor) as yearlyLabor from laborSum group by year order by year;`;

  connection.query(salaryQuery, (error, results) => {
    if (error) {
      console.error("給与情報の取得中にエラーが発生しました:", error);
      res.status(500).send("給与情報の取得中にエラーが発生しました");
    } else {
      connection.query(monthlyLaborQuery, (monthlyError, monthlyResults) => {
        if (monthlyError) {
          console.error('月ごとの人件費の計算中にエラーが発生しました: ' + monthlyError);
          res.status(500).send('月ごとの人件費の計算中にエラーが発生しました');
        } else {
          connection.query(yearlyLaborQuery, (yearlyError, yearlyResults) => {
            if (yearlyError) {
              console.error('年ごとの人件費の計算中にエラーが発生しました: ' + yearlyError);
              res.status(500).send('年ごとの人件費の自動計算中にエラーが発生しました');
            } else {
              console.log('人件費の計算が正常に完了しました');
              res.render("management.ejs", { salaryDatas: results, monthlyDatas: monthlyResults, yearlyDatas: yearlyResults });
            }
          });
        }
      });
    }
  });
});


//自動計算
app.post("/calculate", (req, res) => {
  //時給額・計算期間フォームから入力情報を取得
  const hourlyRate = req.body.hourly_rate;
  const dateFrom = req.body.dateFrom;
  const dateTo = req.body.dateTo;

  // 既存の計算結果データをクリア（「先月働いたが今月働いていない人」を併せて表示しないように）
  const deleteQuery = `DELETE FROM calculation WHERE id NOT IN (SELECT id FROM records WHERE dateRecord BETWEEN ? AND ?)`;

  connection.query(deleteQuery, [dateFrom, dateTo], (error1, results1) => {
    if (error1) {
      console.error('指定範囲外のデータ削除中にエラーが発生しました: ' + error1);
      res.status(500).send('指定範囲外のデータ削除中にエラーが発生しました');
    } else {
      console.log('指定範囲外のデータ削除が正常に完了しました');

 // recordsテーブルから従業員ごとの労働時間を計算しcalculationテーブルに挿入
      const upsertRecordsQuery = `
        INSERT INTO calculation (id, workTime, salary)
        SELECT id,
          SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(break_start, check_in)) + TIME_TO_SEC(TIMEDIFF(check_out, break_end))) ) AS workTime,
          SUM(TIME_TO_SEC(TIMEDIFF(break_start, check_in)) + TIME_TO_SEC(TIMEDIFF(check_out, break_end))) * ? / 3600 AS salary
        FROM records
        WHERE dateRecord BETWEEN ? AND ?
        GROUP BY id
        order by id
        ON DUPLICATE KEY UPDATE
        workTime = VALUES(workTime),
        salary = VALUES(salary);
      `;

// 日ごとに従業員の給与を合計した人件費をlaborSumテーブルに挿入（このテーブルから取得して月ごと/年ごとの人件費を計算）
      const calculateSum = `
        INSERT INTO laborSum (id, month, labor, year, day)
        SELECT id,
          MONTH(dateRecord) AS month,
          (SUM(TIME_TO_SEC(TIMEDIFF(break_start, check_in)) + TIME_TO_SEC(TIMEDIFF(check_out, break_end))) * ? / 3600) AS labor,
          YEAR(dateRecord) AS year,
          DAY(dateRecord) AS day  
        FROM records
        where dateRecord between ? and ?
        GROUP BY YEAR(dateRecord), MONTH(dateRecord), id, DAY(dateRecord)
        ON DUPLICATE KEY UPDATE 
        labor=VALUES(labor);
      `;
      connection.query(upsertRecordsQuery, [hourlyRate, dateFrom, dateTo], (error2, results2) => {
        if (error2) {
          console.error('給与自動計算中にエラーが発生しました: ' + error2);
          res.status(500).send('給与自動計算中にエラーが発生しました');
        } else {
          console.log('給与自動計算が正常に完了しました');
          
          connection.query(calculateSum, [hourlyRate, dateFrom, dateTo], (error3, results3) => {
            if (error3) {
              console.error('人件費計算中にエラーが発生しました: ' + error3);
              res.status(500).send('人件費計算中にエラーが発生しました');
            } else {
              console.log('人件費計算が正常に完了しました');
              res.redirect("/management");
            }
          });
        }
      });
    }
  });
});



//今月の食材費と売り上げ高を登録し、FLコストを計算してDBに挿入
app.post("/postElementFL",(req,res)=>{
  // 月ごとの食材費と売上高と、月ごとの人件費（laborSumテーブルから取得）をelementForFLテーブルに挿入
  const postElement=
    `insert into elementForFL(year,month,foodCost,proceeds,labor)
    select year(now()),month(now()),?,?,sum(labor)
    from laborsum 
    where year=year(now()) and month=month(now())
    group by year,month
    ON DUPLICATE KEY UPDATE 
    foodCost=values(foodCost),
    proceeds=values(proceeds),
    labor=values(labor);
    `;

  // 食材費と売上高入力フォームの値を取得
    const foodCost= req.body.foodCost;
    const proceeds= req.body.proceeds;

 // FL比率を計算してFLテーブルに挿入
    const insertFL=`
    INSERT INTO FL (year, month, flRatio)
    SELECT year, month, (sum(labor+foodcost)/proceeds)*100
    from elementforfl
    GROUP BY year, month, foodCost,proceeds
    ON DUPLICATE KEY UPDATE 
    flRatio = VALUES(flRatio);
    `;
    
    connection.query(postElement,[foodCost,proceeds],(error,results)=>{
      if (error) {
        console.error('FL分析要素の登録中にエラーが発生しました: ' + error);
        res.status(500).send('FL分析要素の登録中にエラーが発生しました');
      } else {
        console.log('FL分析要素の登録が正常に完了しました');
        
        connection.query(insertFL,(error1,results1)=>{
          if (error1) {
            console.error('FL計算中にエラーが発生しました: ' + error1);
            res.status(500).send('FL計算中にエラーが発生しました');
          } else {
            console.log('FL計算が正常に完了しました');
            res.redirect("/management");
          }

        })
      }
    });
});


// FLコストを取得して「ＦＬ分析」ページに表示するルーティング
app.get("/analystics",(req,res)=>{

  // 今月のFLコスト比率を取得
  const getMonthFL=`
    select flRatio from FL where year=year(now()) and month=month(now());
    `;

  // 今月の食材費、売上高、人件費、FLコストを取得（→分析結果に表示させる）
  const getElementFL=`
  SELECT foodCost, proceeds, labor, SUM(foodCost + labor) AS realFL, 0.6 * proceeds AS idealFL
  FROM elementForFL
  WHERE year = YEAR(NOW()) AND month = MONTH(NOW())
  GROUP BY year, month, foodCost, proceeds, labor;

  `;

  //今年の、 月ごとのFL比率を全て取得（→FL比率推移グラフに表示）
  const getAllFL=`select*from FL where year=year(now()) order by year,month`

  connection.query(getMonthFL,(error,results)=>{
    if (error) {
      console.error('FL分析取得中にエラーが発生しました: ' + error);
      res.status(500).send('FL分析取得中にエラーが発生しました');
    } else {
      console.log('FL分析の取得が正常に完了しました');

      connection.query(getElementFL,(error1,results1)=>{
        if (error1) {
          console.error('FL要素の取得中にエラーが発生しました: ' + error1);
          res.status(500).send('FL要素の取得中にエラーが発生しました');
        } else {
          console.log('FL要素の取得中が正常に完了しました');

      connection.query(getAllFL,(error2,results2)=>{
        if (error2) {
          console.error('全てのFLデータの取得中にエラーが発生しました: ' + error2);
          res.status(500).send('全てのFLデータの取得中にエラーが発生しました');
        } else {
          console.log('全てのFLデータの取得が正常に完了しました');
          res.render("analystics.ejs",{monthFL:results,elementFL:results1,allFL:results2});
        }
     }) } 
    })   
    }
  })
});


  
