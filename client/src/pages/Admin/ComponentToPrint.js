import React, {useState, forwardRef, useEffect} from "react";

export const ComponentToPrint = forwardRef(({inv, perfProcedures, onInvoiceUpdate, onProcedureUpdate}, ref) => {
  // console.log('ComponentToPrint >>> inv:', inv);
  // console.log('ComponentToPrint >>> perfProcedures:', perfProcedures);
  const [invoice, setInvoice] = useState(inv);
  const [procedures, setProcedures] = useState(perfProcedures);

  const handleChangeProcedures = async(event, id) => {
    const {name, value} = event.target;
    // console.warn(name, ':', value, 'id:', id);
    let tmpProcedures = [...procedures];
    tmpProcedures.map((tp)=>{
      if(tp.bill.id === id) {
        if(name === 'mwst') tp.bill[name] = tp.bill[name] === 'on' ? false : 'on';
        else tp.bill[name] = value;
      }
    });
    // console.log('tmpProcedures:', tmpProcedures);
    setProcedures(tmpProcedures);
  }

  const handleChangeInvoice = (event) => {
    const { name, value } = event.target;
    // console.log('Event >> name, value:', name, value);
    let title = invoice.title;
    title[name] = value;
    setInvoice(prevState => ({...prevState, ['title']:title}))
  }

  useEffect(() => {
    // console.log('PDF CHANGED INVOICE:', invoice);
    onInvoiceUpdate(invoice);
  }, [invoice]);

  useEffect(() => {
    // console.log('PDF CHANGED PROCEDURES:', procedures);
    onProcedureUpdate(procedures);
  }, [procedures]);

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
            <h2>Rechnungsadresse</h2>
            {/* <h2>18.07.1982</h2> */}
            {/* <p>{invoice.title?.client_firstname} {invoice.title?.client_lastname}</p> */}
            <p><input className='input-blank' id="client_firstname" name="client_firstname" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_firstname} placeholder="firstname"/></p>
            <p><input className='input-blank' id="client_lastname"  name="client_lastname"  onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_lastname}  placeholder="lastname"/></p>
            <p><input className='input-blank' id="street" name="client_adress1" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_adress1} placeholder="street & building"/></p>
            <p><input className='input-blank' id="city"   name="client_adress2" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_adress2} placeholder="city"/></p>
            {/* <p><input className='input-blank' id="index" name="client_adressIndex" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_adressIndex} placeholder="index"/></p> */}
            <p><input className='input-blank' id="country" name="client_country" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.client_country} placeholder="DE"/></p>
          </td>
          <td>
            <div style={{width:"100%", display:"flex", justifyContent:"right"}}>
              <table style={{ fontSize:"14px", borderCollapse:"collapse" }}>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Rechnungsnummer</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    {/* <input className='input-blank' id="steuer" name="steuer" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.number} /> */}
                    {invoice.number}
                  </td>
                </tr>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Rechnungsdatum</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    <input className='input-blank' id="date" name="date" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.date}/>
                  </td>
                </tr>
                <tr>
                  <td style={{ background:"lightgray", border:"1px solid lightgray", padding:"7px 40px 7px 20px" }}>Fälligkeitsdatum</td>
                  <td style={{ border:"1px solid lightgray", width:"140px", paddingLeft:"20px" }}>
                    <input className='input-blank' id="date" name="date" onChange={(event)=>{handleChangeInvoice(event)}} value={invoice.title?.payDate}/>
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
            <th style={{ textAlign:"center" }}>{'Anzahl'}</th>
            <th style={{ textAlign:"center" }}>{'Einzelpreis'}</th>
            <th style={{ textAlign:"center" }}>{'MWST (19%)' }</th>
            <th style={{ textAlign:"center" }}>{'Gesamtpreis'}</th>
          </tr>
        </thead>
        <tbody>
          {procedures.map((procedure)=>{
            procedure.bill.mwst = procedure.bill.mwst ? procedure.bill.mwst : false;
            procedure.bill.qty  = procedure.bill.qty   ? procedure.bill.qty : 1;
            const mwst = 1.19;
            return(
              <tr style={{height:"44px"}}>
                <td style={{ width:"24px", textAlign:"center" }}>1</td>
                {/* <td>{procedure.procedure_id}</td> */}
                <td>{procedure.bill?.procedure}</td>
                <td><input className='input-blank' style={{ textAlign:"center" }} id={"qty_procedure_" + procedure.bill?.id}  name="qty"  onChange={(event)=>{handleChangeProcedures(event, procedure.bill.id)}} value={procedure.bill?.qty} /></td>
                <td><input className='input-blank' style={{ textAlign:"center" }} id={"cost_procedure_" + procedure.bill?.id} name="cost" onChange={(event)=>{handleChangeProcedures(event, procedure.bill.id)}} value={procedure.bill?.procedure_cost} /></td>
                <td style={{ textAlign:"center" }}>
                  <input type="checkbox" id={"MWST19_procedure_" + procedure.bill?.id} name="mwst" checked={procedure.bill?.mwst} onChange={(event)=>{handleChangeProcedures(event, procedure.bill.id)}} />
                  {/* <Checkbox checked={procedure.bill.mwst} value={procedure.bill.mwst} onChange={(event)=>{handleChangeProcedures(event, procedure.bill.id)}} /> */}
                </td>
                <td style={{ textAlign:"center" }}>{Number(procedure.bill?.qty) * Number(procedure.bill?.procedure_cost) * (procedure.bill.mwst ? mwst : 1)}</td>
              </tr>
            )
          })}
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
                  <td style={{ width:"80px" }}>
                    { 
                      procedures.reduce((sumMwst, procedure) => sumMwst + (procedure.bill.mwst ? (procedure.bill.qty * procedure.bill.procedure_cost) * 0.19 : 0), 0).toFixed(2)
                    } &#8364;
                  </td>
                </tr>
                <tr>
                  <td><b>{'Rechnungsbetrag'}</b></td>
                  <td style={{ width:"80px" }}>
                    <b>
                      {
                        procedures.reduce((sumMwst, procedure) => sumMwst + (procedure.bill.qty * procedure.bill.procedure_cost * (procedure.bill.mwst ? 1.19 : 1)), 0).toFixed(2)
                      } &#8364;
                    </b>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>      
    </div>
  );
});