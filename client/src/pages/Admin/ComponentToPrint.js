import React, {useState, forwardRef, useEffect} from "react";

export const ComponentToPrint = forwardRef(({inv, onInvoiceUpdate}, ref) => {
  // console.log('invoice2:', inv);
  const [invoice, setInvoice] = useState(inv);

  const handleChangeData = async(e) => {
    // console.warn(e.target.name, ':', e.target.value);
    setInvoice(prevState => ({...prevState, [e.target.name]: e.target.value}));
  }
      // onInvoiceUpdate(invoice); 
  useEffect(() => {
    // console.log('PDF CHANGED INVOICE:', invoice);
    onInvoiceUpdate(invoice)
  }, [invoice]);

  return (
    <div ref={ref} style={{ width:"800px", padding:"69px 94px 78px", backgroundColor:"white", margin:"0 auto", textAlign:"left", fontSize:"12px" }}>
      <table style={{ width:"100%" }}>
        <tr>
          <td width={250}>
            <img src="/static/logo_blank.svg" style={{ width:"100%" }}/>
          </td>
          <td style={{ textAlign:"right"}}>
            <p>Plastische & Ästhetische Chirurgie</p>
            <p>Dr. med. univ. Kamil Akhundov</p>
            <p>Gertraudenstrahe IS 1017S Berlin</p>
            <br/>
            <p>Tel:+49 (0) 30 92123893</p>
            <p>Mob.:+49 (0) 172 7545411</p>
            <p>Fax.: +49 (0)30 25097547</p>
            <p>E-Mail: info@3tunning-you.com</p>
            <p>Web:www.stunning-you.com
            </p>
          </td>
        </tr>
      </table>

      <h1 style={{ width:"100%", textAlign:"center", margin:"30px auto"}}>RECHNUNG</h1>

      <table style={{ width:"100%" }}>
        <tr>
          <td>
            <p>Rechnungsadresse</p>
            <h2>18.07.1982</h2>
            <p>{invoice.client_firstname} {invoice.client_lastname}</p>
            <p><input className='input-blank' id="street"        name="client_adressStreet"   onChange={handleChangeData} value={invoice.client_adressStreet} placeholder="street & building"/></p>
            <p><input className='input-blank' id="city"          name="client_adressCity"     onChange={handleChangeData} value={invoice.client_adressCity}   placeholder="city"/></p>
            <p><input className='input-blank' id="index"         name="client_adressIndex"    onChange={handleChangeData} value={invoice.client_adressIndex}  placeholder="index"/></p>
            <p><input className='input-blank' id="adressCountry" name="client_adressCountry"  onChange={handleChangeData} value={invoice.client_adressCountry} placeholder="DE"/></p>
          </td>
          <td>
            <div style={{width:"100%", display:"flex", justifyContent:"right"}}>
              <table style={{ fontSize:"14px", borderCollapse:"collapse" }}>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Rechnungsnummer</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    <input className='input-blank' id="steuer" name="steuer" onChange={handleChangeData} value={invoice.steuer} />
                  </td>
                </tr>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Rechnungsdatum</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    <input className='input-blank' id="date" name="date" onChange={handleChangeData} value={invoice.date}/>
                  </td>
                </tr>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Fälligkeitsdatum</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    <input className='input-blank' id="date" name="date" onChange={handleChangeData} value={invoice.payDate}/>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
      <hr/>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead style={{ background:"lightgray" }}>
          <tr style={{height:"44px"}}>
            <th style={{ width:"24px", textAlign:"center" }}>#</th>
            {/* <th style={{width:"30px"}}>Id</th> */}
            <th style={{width:"300px"}}>{'Beschreibung'}</th>
            <th>{'Anzahl'}</th>
            <th>{'Einzelpreis'}</th>
            <th>{'Gesamtpreis'}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{height:"44px"}}>
            <td style={{ width:"24px", textAlign:"center" }}>1</td>
            {/* <td>{invoice.procedure_id}</td> */}
            <td>{invoice.procedure}</td>
            <td><input className='input-blank' id="title" name="qty"  onChange={handleChangeData} value={invoice.qty} /></td>
            <td><input className='input-blank' id="title" name="cost" onChange={handleChangeData} value={invoice.cost} /></td>
            <td>{invoice.qty * invoice.cost}</td>
          </tr>
        </tbody>
      </table>
      <hr/>
      <p>&nbsp;</p>
      <table style={{ width:"100%" }}>
        <tr>
          <td>
            <div style={{ paddingRight:"30px"}}>
              <p>
                Liebe Patientin, lieber Patient,
              </p>
              <p>
                bitte überweisen Sie den Betrag innerhalb von 14 Tagen nach Rechnungserhalt auf folgendes Konto:
              </p>
              <p>&nbsp;</p>
              <p>
                Kontoinhaber: <b>Kamil Akhundov</b> <br/>
                Kreditinstitut: <b>Berliner Sparkasse</b> <br/>
                IBAN: <b>DE46 1005 0000 0190 9438 23</b> <br/>
                BIC: <b>BELADEBEXXX</b>
              </p>
              <p>&nbsp;</p>
              <p>
                bitte uberweisen Sie den Betrag innerhalb von 14 Tagen nach Rechnungserhalt auf folgendes Konto:
              </p>
              <p>&nbsp;</p>
              <p>
                Kontoinhaber: <b>Kamil Akhundov</b> <br/>
                Kreditinstitut: <b>Berliner Sparkasse</b> <br/>
                IBAN: <b>DE46 1005 0000 0190 9438 23</b> <br/>
                BIC: <b>BELADEBEXXX</b>
              </p>
            </div>
          </td>
          <td style={{ textAlign:"right", verticalAlign:"top" }}>
            <div style={{width:"100%", display:"flex", justifyContent:"right"}}>
              <table>
                <tr>
                  <td>{'MWST (19%)'}</td>
                  <td style={{ width:"80px" }}>{(invoice.qty * invoice.cost * 0.19).toFixed(2)} &#8364;</td>
                </tr>
                <tr>
                  <td><b>{'Rechnungsbetrag'}</b></td>
                  <td style={{ width:"80px" }}><b>{(invoice.qty * invoice.cost * 1).toFixed(2)} &#8364;</b></td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      {/* <table style={{width:"240px", margin:"0 0 0 auto"}}>
        <tbody>
          <tr>
            <td>{'Nettobetrag'}</td>
            <td>{(invoice.qty * invoice.cost).toFixed(2)} &#8364;</td>
          </tr>
          { invoice.medind &&
            <tr>
              <td>{'MWST 19%'}</td>
              <td>{(invoice.qty * invoice.cost * 0.19).toFixed(2)} &#8364;</td>
            </tr>
          }
          { invoice.medind &&
            <tr><td colSpan={2}><hr/></td></tr>
          }
          { invoice.medind &&
            <tr style={{ fontWeight:"bold" }}>
              <td>{'Rechnungsbetrag'}</td>
              <td>{(invoice.qty * invoice.cost * 1.19).toFixed(2)} &#8364;</td>
            </tr>
          }
          { !invoice.medind &&
            <tr><td colSpan={2}><hr/></td></tr>
          }
          { !invoice.medind &&
            <tr style={{ fontWeight:"bold" }}>
              <td>{'Rechnungsbetrag'}</td>
              <td>{(invoice.qty * invoice.cost * 1).toFixed(2)} &#8364;</td>
            </tr>
          }
        </tbody>
      </table> */}
      
    </div>
  );
});