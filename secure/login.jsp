<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="IIEH">
<meta name="author" content="GRUPO ENEL">
<link rel="stylesheet" href="../css/bootstrap.min.css">
<link rel="stylesheet" href="../css/bootstrap-theme.min.css">
<link rel="stylesheet" href="../css/enel.css">
<body class="EnelBody">
	<br />
	<br />
	<br />
	<br />
	<div class="container">
		
		<form action="j_security_check" method="post" enctype="UTF-8">
			<div class="row">
				<div class="col-md-4">&nbsp;</div>
				<div class="col-md-4">
					<div id="error" class="alert alert-warning" style="display: none" role="alert">Error de usuario / contraseña</div>
					<div class="panel panel-default">
						<div class="panel-heading">Inicio de Sessi&oacute;n</div>
						<div class="panel-body row">
							<div class="col-md-12">
								<div class="form-group">
									<label for="j_username" class="control-label">Usuario</label> <input id="j_username" type="text" value="" name="j_username" class="form-control" placeholder="Usuario" />
								</div>
							</div>
							<div class="col-md-12">
								<div class="form-group">
									<label for="j_password" class="control-label">Password</label> <input id="j_password" type="password" value="" name="j_password" class="form-control" placeholder="Password" />
								</div>
							</div>
						</div>
						<div class="panel-footer text-right">
							<input type="reset" class="btn btn-default" value="Reset" /> <input type="submit" class="btn btn-default" value="Login" />
						</div>
					</div>
				</div>
				<div class="col-md-4">&nbsp;</div>
			</div>
		</form>
	</div>
	<script type="text/javascript" src="../js/jquery.min.js"></script>
	<script type="text/javascript" src="../js/bootstrap.min.js"></script>
	<script type="text/javascript"> if (<%=request.getParameter("error")%>) $("#error").show(); </script>
</body>
</html>
